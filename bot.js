const djs = require('discord.js');

const client = new djs.Client();

// updates text channel permissions
function updatePermissions(channel, user, bool) {
    return channel.updateOverwrite(user, {
        SEND_MESSAGES: bool,
        VIEW_CHANNEL: bool
    });
}

// checks if user has streaming role
function hasStreamingRole(user) {
    if(user === null || user === undefined) {
        return false;
    } else {
        return user.roles.cache.some(role => role.name === 'Streaming');
    }
}

// check if user is presence is set as streaming
function isStreaming(presence) {
    if(presence === null || presence === undefined) {
        return false;
    } else {
        let acitivity = presence.activities.find(activity => activity.type === "STREAMING");

        if(acitivity !== undefined) {
            return true;
        } else {
            return false;
        }
    }
}

client.on('ready', () => {
    console.log(`Connected to discord. (${client.user.tag})`);
    
});

client.on("presenceUpdate", function(oldPresence, newPresence) {
    let thisguild = client.guilds.resolve(newPresence.guild.id);
    let streamerRole = thisguild.roles.cache.find(role => role.name === 'Streaming');
    let user = thisguild.members.cache.find(user => user.id === newPresence.userID);

    if(isStreaming(newPresence)) {
        if(!hasStreamingRole(user)) {
            user.roles.add(streamerRole);
        }
    } else {
        if(hasStreamingRole(user)) {
            user.roles.remove(streamerRole);
        }
    }
});

client.on('voiceStateUpdate', function(oldMember, newMember) {
    let thisguild = client.guilds.resolve(newMember.guild);
    let user = null;

    if(oldMember === null) {
        user = thisguild.members.cache.find(user => user.id === newMember.id);
    } else {
        user = thisguild.members.cache.find(user => user.id === oldMember.id);
    }

    let newVoice = newMember.channel;
    let oldVoice = oldMember.channel;

    if((oldVoice !== null && newVoice !== null) && oldVoice.name === newVoice.name) {
        // mute/unmute and deafen/undeafen
        // do nothing
    } else if(oldVoice === null && newVoice !== null) {
        // join channel
        // find text channel off voice channel name
        let newText = thisguild.channels.cache.find(channel => channel.name === newVoice.name && channel.type === 'text');

        // add permissions
        updatePermissions(newText, user, true)
        .then().catch(err => console.log(err));

    } else if(oldVoice !== null && newVoice === null) {
        // leave channel
        // find text channel off voice channel name
        let oldText = thisguild.channels.cache.find(channel => channel.name === oldVoice.name && channel.type === 'text');

        // remove permissions
        updatePermissions(oldText, user, false)
        .then().catch(err => console.log(err));

    } else {
        // move channel
        // find text channels off voice channel names
        let newText = thisguild.channels.cache.find(channel => channel.name === newVoice.name && channel.type === 'text');
        let oldText = thisguild.channels.cache.find(channel => channel.name === oldVoice.name && channel.type === 'text');

        // add permissions to new channel
        updatePermissions(newText, user, true)
        .then().catch(err => console.log(err));

        // remove permissions from old channel
        updatePermissions(oldText, user, false)
        .then().catch(err => console.log(err));
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);