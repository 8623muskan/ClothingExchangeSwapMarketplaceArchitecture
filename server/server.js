const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const swapRoutes = require('./routes/swapRoutes');
const Swap = require('./models/Swap');

const app = express();
const httpServer = http.createServer(app);

/*
 * =========================================================
 * SOCKET.IO
 * =========================================================
 */

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {

    console.log(
        `CHAT SOCKET CONNECTED: ${socket.id}`
    );

    /*
     * =====================================================
     * JOIN SWAP CHAT ROOM
     * =====================================================
     */

    socket.on(
        'join_swap_room',
        async (swapId) => {
            try {

                const cleanSwapId =
                    String(
                        swapId || ''
                    ).trim();

                if (!cleanSwapId) {

                    console.warn(
                        `CHAT ROOM JOIN REJECTED: empty swap ID - ${socket.id}`
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Swap ID is required.'
                        }
                    );

                    return;
                }

                /*
                 * Validate MongoDB ObjectId
                 */
                if (
                    !mongoose.Types.ObjectId.isValid(
                        cleanSwapId
                    )
                ) {

                    console.warn(
                        `CHAT ROOM JOIN REJECTED: invalid swap ID - ${cleanSwapId}`
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Invalid swap ID.'
                        }
                    );

                    return;
                }

                /*
                 * Confirm swap exists
                 */
                const swap =
                    await Swap.findById(
                        cleanSwapId
                    );

                if (!swap) {

                    console.warn(
                        `CHAT ROOM JOIN REJECTED: swap not found - ${cleanSwapId}`
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Swap request not found.'
                        }
                    );

                    return;
                }

                /*
                 * Create room name
                 */
                const room =
                    `swap:${cleanSwapId}`;

                /*
                 * Join room
                 */
                socket.join(room);

                console.log(
                    `CHAT ROOM JOINED: ${socket.id} -> ${room}`
                );

            } catch (error) {

                console.error(
                    'CHAT ROOM JOIN ERROR:',
                    error
                );

                socket.emit(
                    'chat_error',
                    {
                        message:
                            'Failed to join chat room.'
                    }
                );
            }
        }
    );

    /*
     * =====================================================
     * SEND CHAT MESSAGE
     * =====================================================
     */

    socket.on(
        'send_message',
        async (payload) => {

            try {

                const swapId =
                    String(
                        payload?.swapId || ''
                    ).trim();

                const senderId =
                    String(
                        payload?.senderId || ''
                    ).trim();

                const messageText =
                    String(
                        payload?.messageText || ''
                    ).trim();

                /*
                 * Validate basic payload
                 */
                if (
                    !swapId ||
                    !senderId ||
                    !messageText
                ) {

                    console.warn(
                        'CHAT MESSAGE REJECTED: invalid payload',
                        payload
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Invalid chat message.'
                        }
                    );

                    return;
                }

                /*
                 * Validate message length
                 */
                if (
                    messageText.length > 2000
                ) {

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Message cannot exceed 2000 characters.'
                        }
                    );

                    return;
                }

                /*
                 * Validate swap ID
                 */
                if (
                    !mongoose.Types.ObjectId.isValid(
                        swapId
                    )
                ) {

                    console.warn(
                        'CHAT MESSAGE REJECTED: invalid swap ID',
                        swapId
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Invalid swap ID.'
                        }
                    );

                    return;
                }

                /*
                 * Validate sender ID
                 */
                if (
                    !mongoose.Types.ObjectId.isValid(
                        senderId
                    )
                ) {

                    console.warn(
                        'CHAT MESSAGE REJECTED: invalid sender ID',
                        senderId
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Invalid user ID.'
                        }
                    );

                    return;
                }

                /*
                 * =================================================
                 * FIND SWAP
                 * =================================================
                 */

                const swap =
                    await Swap.findById(
                        swapId
                    );

                if (!swap) {

                    console.warn(
                        `CHAT MESSAGE REJECTED: swap not found - ${swapId}`
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'Swap request not found.'
                        }
                    );

                    return;
                }

                /*
                 * =================================================
                 * CHECK PARTICIPANT
                 * =================================================
                 *
                 * Only requester or owner may chat.
                 */

                const isParticipant =
                    String(
                        swap.requester
                    ) === senderId ||
                    String(
                        swap.owner
                    ) === senderId;

                if (!isParticipant) {

                    console.warn(
                        `CHAT MESSAGE REJECTED: user ${senderId} is not a participant of swap ${swapId}`
                    );

                    socket.emit(
                        'chat_error',
                        {
                            message:
                                'You are not a participant in this swap.'
                        }
                    );

                    return;
                }

                /*
                 * =================================================
                 * CREATE MESSAGE
                 * =================================================
                 */

                const chatMessage = {
                    senderId,
                    messageText,
                    timestamp:
                        new Date()
                };

                /*
                 * =================================================
                 * SAVE MESSAGE TO MONGODB
                 * =================================================
                 */

                swap.messages.push(
                    chatMessage
                );

                await swap.save();

                /*
                 * =================================================
                 * PREPARE RESPONSE
                 * =================================================
                 */

                const responseMessage = {
                    senderId,
                    messageText,
                    timestamp:
                        chatMessage.timestamp.toISOString()
                };

                /*
                 * =================================================
                 * CHAT ROOM
                 * =================================================
                 */

                const room =
                    `swap:${swapId}`;

                console.log(
                    `CHAT MESSAGE SAVED: ${senderId} -> ${room}: ${messageText}`
                );

                /*
                 * =================================================
                 * SEND TO BOTH CHAT USERS
                 * =================================================
                 */

                io.to(room).emit(
                    'receive_message',
                    responseMessage
                );

            } catch (error) {

                console.error(
                    'CHAT MESSAGE ERROR:',
                    error
                );

                socket.emit(
                    'chat_error',
                    {
                        message:
                            'Failed to send message.'
                    }
                );
            }
        }
    );

    /*
     * =====================================================
     * SOCKET DISCONNECT
     * =====================================================
     */

    socket.on(
        'disconnect',
        (reason) => {

            console.log(
                `CHAT SOCKET DISCONNECTED: ${socket.id} - ${reason}`
            );
        }
    );
});

/*
 * =========================================================
 * SERVER CONFIGURATION
 * =========================================================
 */

const PORT =
    Number(process.env.PORT) || 5000;

const HOST =
    '127.0.0.1';

const MONGODB_URI =
    process.env.MONGODB_URI;

if (!MONGODB_URI) {

    console.error(
        'FATAL: MONGODB_URI is not configured in .env'
    );

    process.exit(1);
}

/*
 * =========================================================
 * CORS
 * =========================================================
 */

app.use(
    cors({
        origin: 'http://localhost:4200',
        credentials: true
    })
);

/*
 * =========================================================
 * BODY PARSERS
 * =========================================================
 */

app.use(
    express.json({
        limit: '10mb'
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

/*
 * =========================================================
 * UPLOADED CLOTHING IMAGES
 * =========================================================
 */

app.use(
    '/uploads',
    express.static(
        path.join(
            __dirname,
            'uploads'
        )
    )
);

/*
 * =========================================================
 * ROOT
 * =========================================================
 */

app.get(
    '/',
    (req, res) => {

        res.status(200).json({
            success: true,
            message:
                'Clothing Exchange & Swap Marketplace API',
            version: '1.0.0'
        });
    }
);

/*
 * =========================================================
 * HEALTH
 * =========================================================
 */

app.get(
    '/api/health',
    (req, res) => {

        res.status(200).json({
            success: true,
            message:
                'API is running successfully',
            database:
                mongoose.connection.readyState === 1
                    ? 'connected'
                    : 'disconnected'
        });
    }
);

/*
 * =========================================================
 * API ROUTES
 * =========================================================
 */

app.use(
    '/api/auth',
    authRoutes
);

app.use(
    '/api/items',
    itemRoutes
);

app.use(
    '/api/swaps',
    swapRoutes
);

/*
 * =========================================================
 * 404 HANDLER
 * =========================================================
 */

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

/*
 * =========================================================
 * GLOBAL ERROR HANDLER
 * =========================================================
 */

app.use(
    (err, req, res, next) => {

        console.error(
            'SERVER ERROR:',
            err
        );

        res.status(
            err.status || 500
        ).json({
            success: false,
            message:
                err.message ||
                'Internal server error'
        });
    }
);

/*
 * =========================================================
 * MONGODB + SERVER STARTUP
 * =========================================================
 */

mongoose
    .connect(MONGODB_URI)
    .then(() => {

        console.log(
            'MongoDB connected successfully'
        );

        httpServer.listen(
            PORT,
            HOST,
            () => {

                console.log(
                    `Server running at http://${HOST}:${PORT}`
                );

                console.log(
                    `Socket.IO server running at ws://${HOST}:${PORT}`
                );
            }
        );
    })
    .catch(
        (error) => {

            console.error(
                'MongoDB connection failed:',
                error
            );

            process.exit(1);
        }
    );

/*
 * =========================================================
 * GRACEFUL SHUTDOWN
 * =========================================================
 */

process.on(
    'SIGINT',
    async () => {

        try {

            await mongoose.connection.close();

            console.log(
                'MongoDB connection closed'
            );

            process.exit(0);

        } catch (error) {

            console.error(
                'Shutdown error:',
                error
            );

            process.exit(1);
        }
    }
);