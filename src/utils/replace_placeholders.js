const { User } = require('../lib');

/**
 * 
 * @param {string} text
 * @param {User} user 
 * @param {User} author 
 * @param {{
 *  type: string,
 *  reason: string,
 *  duration: number,
 * }} punishment 
 */
module.exports = (text, user, author, punishment = {}) => {
    const placeholders = [
        // User
        { aliases: ['@user', 'user.mention'], value: user.toString(), },
        { aliases: ['user.tag'], value: user.tag, },
        { aliases: ['user.username', 'user.name'], value: user.username, },
        { aliases: ['user.discriminator'], value: user.discriminator, },
        { aliases: ['user.id'], value: user.id, },
        { aliases: ['user.avatar', 'user.icon'], value: user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }), },
        // Author
        { aliases: ['@author', 'author.mention', '@staff', 'staff.mention'], value: author.toString(), },
        { aliases: ['author.tag', 'staff.tag'], value: author.tag, },
        { aliases: ['author.username', 'user.name'], value: author.username, },
        { aliases: ['author.discriminator'], value: author.discriminator, },
        { aliases: ['author.id', 'staff.id'], value: author.id, },
        { aliases: ['author.avatar', 'author.icon', 'staff.avatar', 'staff.icon'], value: author.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 }), },
        // Punishment
        { aliases: ['punishment', 'punishment.type'], value: punishment.type, },
        { aliases: ['punishment.reason'], value: punishment.reason, },
        { aliases: ['punishment.duration'], value: punishment.duration, },
    ];

    text = text.replace(/\{([^}]+)\}/g, (match, placeholder) => {
        const found = placeholders.find(p => p.aliases.includes(placeholder));
        if(found) return found.value;
        return match;
    });

    return text;
}