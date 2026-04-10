export function createCallOnce(): (fn: () => unknown) => unknown {
    let called = false;

    return function (fn: () => unknown) {
        if (!called) {
            called = true;
            return fn();
        }
    };
}

export const num = (val: string | number | null | undefined): number => val ? +val : 0;
