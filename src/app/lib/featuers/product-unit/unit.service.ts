import { Unit, IUnit } from "./unit.model";

export class UnitService {
    static async getAll() {
        return await Unit.find().sort({ name: 1 });
    }

    static async create(data: Partial<IUnit>) {
        const unit = new Unit(data);
        return await unit.save();
    }

    static async update(id: string, data: Partial<IUnit>) {
        return await Unit.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await Unit.findByIdAndDelete(id);
    }
}
