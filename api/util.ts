export const num = (val: string | number | null | undefined): number => val ? +val : 0;

export const yesterday = (): Date => {
    const value = new Date();

    value.setDate(value.getDate() - 1);

    return value;
};
