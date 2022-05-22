import _ from "lodash";
import { Room } from "./_types";

export function secureRoomInfo(room: Room): Room {
    return {
        ...room,
        users: _.mapValues(room.users, ({ editToken, ...user }) => user) as any,
    }
}
export const ROOM_EXPIRE_TIMEOUT = 60 * 60 * 24 * 2;