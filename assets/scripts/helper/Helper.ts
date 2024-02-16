export const mapRange = (num: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    let value: number = (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    //value = value < out_min ? out_min : value;
    //value = value > out_max ? out_max : value;
    return value;
}

export const mapRangeFrom01 = (num: number, out_min: number, out_max: number) => {
    return mapRange (num, 0, 1, out_min, out_max);
}

export const mapRangeTo01 = (num: number, in_min: number, in_max: number) => {
    return mapRange (num, in_min, in_max, 0, 1);
}