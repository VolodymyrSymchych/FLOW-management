declare global {
    namespace JSX {
        interface IntrinsicElements {
            'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                icon: string;
                width?: string | number;
                height?: string | number;
                mode?: string;
                inline?: boolean;
                rotate?: string | number;
                flip?: string;
            };
        }
    }
}

export { };
