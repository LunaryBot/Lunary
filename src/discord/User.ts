import { APIUser, UserFlags } from 'discord-api-types/v10';

class User {
    public id: string;
    public username: string;
    public discriminator: string;
    public avatar: string | null;
    public bot: boolean | undefined;
    public system: boolean | undefined;
    public mfaEnabled: boolean | undefined;
    public banner: string | null | undefined;
    public accentColor: number | null | undefined;
    public locale: string | undefined;
    public verified: boolean | undefined;
    public email: string | null | undefined;
    public flags: UserFlags | undefined;
    public premiumType: 0 | 1 | 2 | undefined;
    public publicFlags: UserFlags | undefined;

    constructor(data: APIUser) {
        this.id = data.id;

        this.username = data.username;

        this.discriminator = data.discriminator;

        this.avatar = data.avatar;

        this.bot = data.bot;

        this.mfaEnabled = data.mfa_enabled;

        this.banner = data.banner;

        this.accentColor = data.accent_color;

        this.locale = data.locale;

        this.verified = data.verified;

        this.email = data.email;

        this.flags = data.flags;

        this.premiumType = data.premium_type;

        this.publicFlags = data.public_flags;
    }
}

export default User;