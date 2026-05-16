import { Packaging, IPackaging } from "./packaging.mode";

export class PackagingService {
    static async getAll() {
        return await Packaging.find().sort({ createdAt: -1 });
    }

    static async create(data: Partial<IPackaging>) {
        const packaging = new Packaging(data);
        return await packaging.save();
    }

    static async update(id: string, data: Partial<IPackaging>) {
        return await Packaging.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return await Packaging.findByIdAndDelete(id);
    }
}
