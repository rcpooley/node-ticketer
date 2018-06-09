const {ticketSchema, sprintSchema} = require('./schema');

module.exports = function (conn) {
    return {
        Ticket: conn.model('Ticket', ticketSchema),
        Sprint: conn.model('Sprint', sprintSchema)
    }
};