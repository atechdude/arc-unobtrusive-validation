import { injectable } from "inversify";
import { IUtil } from "../interfaces/IUtil";
@injectable()
export class Util implements IUtil {

    generateGuid(): string {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;

    }
}
