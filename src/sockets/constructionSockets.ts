import { Server, Socket } from 'socket.io';
import constructionModels, { ConstructionRequest, PaymentInfo } from '../models/constructionModels';
const CryptoJS = require('crypto-js');

export default (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('a user connected');

        // Send all construction requests to the client
        constructionModels.find({}).then((requests: ConstructionRequest[]) => {
            console.log('requests sent');
            socket.emit('requestsFetched', requests)
        }).catch((error: Error) => {
            console.warn('error fetching requests ', error)
        })

        // Add a new construction request
        socket.on('addRequest', (request: ConstructionRequest, completionHandler: (() => void)) => {
            const newRequest = new constructionModels(request)
            newRequest.status = 'Pending';
            newRequest.save().then((req) => {
                completionHandler();
                io.emit('requestAdded', req);
            }).catch((error) => {
                console.warn('Error saving request', error);
            })
        })

        // Update an existing construction request
        socket.on('updateRequest', (updatedRequest: ConstructionRequest, completionHandler: (() => void)) => {
            constructionModels.findByIdAndUpdate(updatedRequest._id, updatedRequest, { new: true }).then((request) => {
                completionHandler();
                io.emit('requestUpdated', updatedRequest)
            }).catch((error: Error) => {
                console.warn('Error updating request', error)
            })
        });

        // Delete an existing construction request
        socket.on('deleteRequest', (id: string, completionHandler: (() => void)) => {

            //look for request with this id and delete it
            constructionModels.findByIdAndDelete(id).then(() => {
                completionHandler();
                io.emit('requestDeleted', id);
            }).catch((error: Error) => {
                console.warn('Error deleting request', error);
            })
        });

        //Payment process
        // TODO : Change the encryption to public and private keys with aes and rsa
        // first encrypt the key with rsa to generate a symmetric key and send it here
        // then decrypt the key with rsa to regenrate the original key and decrypt the data with it
        socket.on('makePayment', async (data: string) => {

            const key = process.env.ENCRYPTION_KEY
            const decryptedData = CryptoJS.Rabbit.decrypt(data, key).toString(CryptoJS.enc.Utf8);
            const model: { paymentData: PaymentInfo, constructionRequest: ConstructionRequest } = JSON.parse(decryptedData);

            //2 seconds delay to simulate payment processing
            setTimeout(() => {
                const newRequest = new constructionModels(model.constructionRequest)

                //save the card and emit a successful payment event back to the specific user
                //and emit a request addition to all users
                newRequest.save().then(() => {
                    io.emit('requestAdded', model.constructionRequest);
                    io.to(socket.id).emit('paymentSuccess');
                }).catch((error: Error) => {
                    console.warn(error);
                })
            }, 2000);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

    });
};
