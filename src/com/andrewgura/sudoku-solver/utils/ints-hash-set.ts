
/** Implementation for quick operations with set of small integers.
 * Used as set of possible values of cell and possible positions of value
 * 0b100111 <=> [0, 1, 2, 5]
 * 0b100000 <=> [5]
 * 0b010101 <=> [0, 2, 4]
 * */
export default class IntsHashSet {

    private _hash: number = 0;

    public get hash(): number {
        return this._hash;
    }

    constructor(hash: number = 0) {
        this._hash = hash;
    }

    public fromSet(set: Set<number>): void {
        this._hash = 0;
        for (const value of set.values()) {
            this._hash += 1 << value;
        }
    }

    public fromArray(array: number[]): void {
        this._hash = 0;
        for (const value of array) {
            this._hash += 1 << value;
        }
    }

    public addItem(value: number): void {
        this._hash = this._hash | (1 << value)
    }

    public removeItem(value: number): void {
        this._hash = this._hash & ~(1 << value)
    }

    public hasItem(value: number): boolean {
        return !!(this._hash & (1 << value))
    }

    public isEmpty(): boolean {
        return this._hash === 0;
    }

    public isSingleElement(): boolean {
        // quick check is power of two
        return this._hash && (!(this._hash&(this._hash-1)));
    }

    public toArray(): number[] {
        const res: number[] = [];
        let hash: number = this._hash;
        let i: number = 0;
        while (hash) {
            if (!!(hash & (1 << i))) {
                res.push(i);
                hash = hash & ~(1 << i);
            }
            i++;
        }
        return res;
    }

    public clone(): IntsHashSet {
        return new IntsHashSet(this._hash);
    }


}
