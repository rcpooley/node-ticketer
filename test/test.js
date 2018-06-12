const expect = require('chai').expect;
const mongoose = require('mongoose');
const Ticketer = require('../index');

const ticketer = new Ticketer('mongodb://localhost/ticketer');

describe('Ticketer', () => {
    let ticketID;

    it('should clear the db', async () => {
        await ticketer.deleteAllTickets();
    });

    describe('Creating a ticket', () => {
        it('should create the ticket', async () => {
            let ticket = await ticketer.createTicket({
                tags: ['atag']
            });
            expect(ticket).to.have.property('_id');
            expect(ticket)
                .to.have.property('tags')
                .that.is.an('Array').includes('atag');
            expect(ticket)
                .to.have.property('createdAt')
                .that.is.a('Date');

            ticketID = ticket._id;
        });
    });

    describe('Finding the ticket', () => {
        it('should find the ticket with objectid', async () => {
            let ticket = await ticketer.getTicketById(ticketID);
            expect(ticket._id.toString()).to.equal(ticketID.toString());
        });

        it('should find the ticket with string id', async () => {
            let ticket = await ticketer.getTicketById(ticketID.toString());
            expect(ticket._id.toString()).to.equal(ticketID.toString());
        });

        it('should not find ticket with random id', async () => {
            let randomID = new mongoose.Types.ObjectId().toString();
            try {
                await ticketer.getTicketById(randomID);
                expect(true).false;
            } catch (e) {
                expect(e.toString()).to.include(randomID);
            }
        });
    });

    describe('Updating the ticket', () => {
        let ticket;

        it('should get the ticket', async () => {
            ticket = await ticketer.getTicketById(ticketID);
            expect(ticket._id.toString()).to.equal(ticketID.toString());
        });

        it('should update tags', async () => {
            ticket.tags.push('new tag!');
            let newTicket = await ticketer.updateTicket(ticket);
            expect(newTicket._id.toString()).to.equal(ticketID.toString());
            expect(newTicket.tags).to.eql(ticket.tags);
        });

        it('should update fields', async () => {
            ticket.fields['new field'] = 'new val';
            let newTicket = await ticketer.updateTicket(ticket);
            expect(newTicket._id.toString()).to.equal(ticketID.toString());
            expect(newTicket.fields)
                .to.have.property('new field')
                .that.equal('new val');
        });
    });

    describe('Deleting the ticket', () => {
        it('should delete the ticket', async () => {
            await ticketer.deleteTicket(ticketID);
        });

        it('should not delete a second time', async () => {
            try {
                await ticketer.deleteTicket(ticketID);
                expect(true).false;
            } catch (e) {
                expect(e.toString()).to.include(ticketID.toString());
            }
        });
    });

    describe('Finding tickets by tag', () => {
        let ticketXY, ticketYZ, ticketXZ, ticketXYZ, ticketY;
        let ticketIDs;

        it('should delete all tickets', async () => {
            await ticketer.deleteAllTickets();
        });

        it('should create tickets', async function () {
            this.timeout(5000);
            let tickets = await Promise.all([
                ticketer.createTicket({tags: ['x', 'y']}),
                ticketer.createTicket({tags: ['y', 'z']}),
                ticketer.createTicket({tags: ['x', 'z']}),
                ticketer.createTicket({tags: ['x', 'y', 'z']}),
                ticketer.createTicket({tags: ['y']})
            ]);
            ticketIDs = tickets.map(ticket => ticket._id.toString());
            [ticketXY, ticketYZ, ticketXZ, ticketXYZ, ticketY] = ticketIDs;
        });

        it('should find tickets containing x or z', async function () {
            this.timeout(5000);
            let tickets = await ticketer.getTicketsByTag(['x', 'z'], Ticketer.TAG_ATLEASTONE);
            let ids = tickets.map(ticket => ticket._id.toString());
            expect(ids).to.have.lengthOf(4);
            expect(ids).to.include(ticketXY);
            expect(ids).to.include(ticketYZ);
            expect(ids).to.include(ticketXZ);
            expect(ids).to.include(ticketXYZ);
        });

        it('should find tickets containing x and z', async () => {
            let tickets = await ticketer.getTicketsByTag(['x', 'z'], Ticketer.TAG_ALL);
            let ids = tickets.map(ticket => ticket._id.toString());
            expect(ids).to.have.lengthOf(2);
            expect(ids).to.include(ticketXZ);
            expect(ids).to.include(ticketXYZ);
        });

        it('should find tickets containing neither x nor z', async () => {
            let tickets = await ticketer.getTicketsByTag(['x', 'z'], Ticketer.TAG_NONE);
            let ids = tickets.map(ticket => ticket._id.toString());
            expect(ids).to.have.lengthOf(1);
            expect(ids).to.include(ticketY);
        });

        it('should delete tickets', async () => {
            for (let i = 0; i < ticketIDs.length; i++) {
                await ticketer.deleteTicket(ticketIDs[i]);
            }
        });
    });
});