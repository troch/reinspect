/// <reference types="react" />
export declare const useState: <S>(
    initialState: S | (() => S),
    id: string | number
) => [S, import('react').Dispatch<import('react').SetStateAction<S>>];
