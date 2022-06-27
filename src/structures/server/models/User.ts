import { Field, ID, ObjectType } from 'type-graphql';

const nullable = { nullable: true };

@ObjectType()
class User {
    @Field(_type => ID)
    id: string;

    @Field()
    username: string;

    @Field(nullable)
    accent_color?: number;

    @Field()
    avatar: string;

    @Field(nullable)
    banner?: string;
    
    @Field(nullable)
    banner_color?: string;

    @Field()
    discriminator: string;

    @Field(nullable)
    email?: string;

    @Field(nullable)
    flags?: number;

    @Field(nullable)
    locale?: string;

    @Field(nullable)
    mfa_enabled?: boolean;

    @Field()
    public_flags: number;

    @Field(nullable)
    verified?: boolean;
}

export default User;