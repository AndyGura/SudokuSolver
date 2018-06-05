export default class AppUtils {

    public static toCellNumeration(x: number, y: number): number {
        return y * 3 + x;
    }

    public static fromCellNumeration(index: number): { x: number, y: number } {
        return {
            x: index % 3,
            y: Math.floor(index / 3)
        };
    }


}