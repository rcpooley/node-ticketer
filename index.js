const mongoose = require('mongoose');
const model = require('./db/model');

class Ticketer {

    constructor(connUrl) {
        this.conn = mongoose.createConnection(connUrl);
        this.models = model(this.conn);
    }

    async createTicket(settings) {
        return (await this.models.Ticket.create(settings)).toObject();
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
        if (typeof tags === 'string') {
            tags = [tags]
        }

        let query;
        switch (tagType) {
            case Ticketer.TAG_ALL:
                query = {tags: {$all: tags}};
                break;
            case Ticketer.TAG_ATLEASTONE:
                let subQueries = tags.map(tag => {
                    return {tags: {$all: [tag]}};
                });
                query = {$or: subQueries};
                break;
            case Ticketer.TAG_NONE:
                query = {tags: {$nin: tags}};
                break;
            default:
                throw new Error('Invalid tag type');
        }


        let tickets = await this.models.Ticket.find(query);
        return tickets.map(ticket => ticket.toObject());
    }

    async getAllTickets() {
        let tickets = await this.models.Ticket.find();
        return tickets.map(ticket => ticket.toObject());
    }

    async deleteAllTickets() {
        let tickets = await this.models.Ticket.deleteMany();
        return tickets;
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