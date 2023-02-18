export function createCallOnce() {
    let called = false;

    return function (fn) {
        if (!called) {
            called = true;

            return fn();
        }
    }
}

export const num = val => val ? +val : 0;
