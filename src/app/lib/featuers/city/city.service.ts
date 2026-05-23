import { City, ICity } from "./city.model";

export class CityService {
    static async getAll(filter: any = {}) {
        return await City.find(filter).sort({ name: 1 });
    }

    static async getUniqueStates() {
        const states = await City.distinct("state");
        return states.filter((s): s is string => typeof s === "string" && s.trim() !== "").sort();
    }

    static async create(data: Partial<ICity>) {
        const city = new City(data);
        return await city.save();
    }

    static async update(id: string, data: Partial<ICity>) {
        return await City.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await City.findByIdAndDelete(id);
    }
}
