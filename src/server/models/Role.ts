import { Field, ID, ObjectType, UseMiddleware } from 'type-graphql';

const nullable = { nullable: true };

@ObjectType()
class RolePermissions {
    @Field()
    allow: string;

    @Field()
    deny: string;
}

@ObjectType()
class Role {
    @Field(_type => ID,)
    id: string;

    @Field()
    createdAt: number;
   
    @Field()
    name: string;

    @Field()
    color: number;

    @Field()
    hoist: boolean;

    @Field(nullable)
    icon: string;

    @Field()
    managed: boolean;

    @Field()
    mentionable: boolean;

    @Field(() => RolePermissions)
    permissions: RolePermissions;

    @Field()
    position: number;

    @Field(nullable)
    unicodeEmoji: string;
}

export default Role;