import express, { Application } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import constructionSockets from './sockets/constructionSockets';

class App {
    public app: Application;
    public server: http.Server;
    public io: Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: '*'
            }
        });

        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeSockets();
    }

    private async connectToDatabase() {
        const connectionString = process.env.MONGODB_CONNECTION_STRING as string;
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions

        try {
            await mongoose.connect(connectionString, options);

            console.log('Connected to database');
        } catch (err) {
            console.error('Error connecting to database:', err);
            process.exit(1);
        }
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(cors());
    }

    private initializeSockets() {
        constructionSockets(this.io);
    }

    public start() {
        const port = process.env.PORT || 3001;
        this.server.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    }
}

export default App;
