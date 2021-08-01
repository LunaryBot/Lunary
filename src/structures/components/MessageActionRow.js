const MessageButton = require("./MessageButton");
const MessageSelectMenu = require("./MessageSelectMenu");

module.exports = class MessageActionRow {
    constructor() {
        this.type = 1
        this.components = []
    }

    addComponent(component) {
        if(!(component instanceof MessageButton) && !(component instanceof MessageSelectMenu)) {
            if(component.type == 2) component = new MessageButton(component)
            else if(component.type == 3) component = new MessageSelectMenu(component)
            else return this
        }

        this.components.push(component)
        return this
    }

    addComponents(...components) {
        this.components.push(...components.flat(Infinity).map(function(component) {
            if(!(component instanceof MessageButton) && !(component instanceof MessageSelectMenu)) {
                if(component.type == 2) component = new MessageButton(component)
                else if(component.type == 3) component = new MessageSelectMenu(component)
            }

            return component
        }))
        return this
    }
}