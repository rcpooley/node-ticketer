const mongoose = require('mongoose');
const model = require('./db/model');

class Ticketer {

    constructor(connUrl) {
        this.conn = mongoose.createConnection(connUrl);
        this.models = model(this.conn);
    }

    async createTicket(settings) {
        return (await new this.models.Ticket(settings).save()).toObject();
    }

    async getTicketById(ticketID) {
        let ticket = await this.models.Ticket.findById(ticketID);
        if (ticket == null) {
            throw new Error(`Ticket with id ${ticketID} does not exist`);
        } else {
            return ticket.toObject();
        }
    }

    async getTicketsByTag(tags, tagType) {

    }

    async updateTicket(newTicket) {
        let update = {};
        if ('tags' in newTicket) update.tags = newTicket.tags;
        if ('fields' in newTicket) update.fields = newTicket.fields;

        let ticket = await this.models.Ticket.findByIdAndUpdate(newTicket._id.toString(), update, {new: true});
        if (ticket == null) {
            throw new Error(`Ticket with id ${newTicket._id} does not exist`);
        }
        return ticket.toObject();
    }

    async deleteTicket(ticketID) {
        let ticket = await this.models.Ticket.findByIdAndDelete(ticketID);
        if (ticket == null) {
            throw new Error(`Ticket with id ${ticketID} does not exist`);
        } else {
            return ticket.toObject();
        }
    }
}

Ticketer.TAG_NONE = 0;
Ticketer.TAG_ATLEASTONE = 1;
Ticketer.TAG_ALL = 2;

module.exports = Ticketer;