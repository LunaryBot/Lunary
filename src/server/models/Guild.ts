import { Field, ID, ObjectType, UseMiddleware } from 'type-graphql';

import DefaultValue from '../utils/DefaultValue';

import Channel from './Channel';
import Role from './Role';
import Member from './Member';

@ObjectType()
class Guild {
    @Field(_type => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    icon: string;

    @Field({ defaultValue: false })
    @UseMiddleware(DefaultValue(false))
    access?: boolean;

    @Field(_type => [String])
    features: string[];

    @Field(() => [Channel], { defaultValue: [] })
    @UseMiddleware(DefaultValue([]))
    channels?: Array<Channel>;

    @Field(() => [Role], { defaultValue: [] })
    @UseMiddleware(DefaultValue([]))
    roles?: Array<Role>;
}

export default Guild;

export { Channel, Member, Role }
