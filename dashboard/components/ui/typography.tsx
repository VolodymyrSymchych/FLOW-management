import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva(
    "text-text-primary",
    {
        variants: {
            variant: {
                h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
                h2: "scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0",
                h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
                h4: "scroll-m-20 text-xl font-semibold tracking-tight",
                h5: "scroll-m-20 text-lg font-semibold tracking-tight",
                h6: "scroll-m-20 text-base font-semibold tracking-tight",
                p: "leading-7 [&:not(:first-child)]:mt-6",
                blockquote: "mt-6 border-l-2 border-primary pl-6 italic text-text-secondary",
                ul: "my-6 ml-6 list-disc [&>li]:mt-2",
                ol: "my-6 ml-6 list-decimal [&>li]:mt-2",
                lead: "text-xl text-text-secondary",
                large: "text-lg font-semibold",
                small: "text-sm font-medium leading-none",
                muted: "text-sm text-text-secondary",
                code: "relative rounded bg-surface-elevated px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
            },
            color: {
                default: "text-text-primary",
                secondary: "text-text-secondary",
                tertiary: "text-text-tertiary",
                primary: "text-primary",
                success: "text-success",
                warning: "text-warning",
                danger: "text-danger",
            },
        },
        defaultVariants: {
            variant: "p",
            color: "default",
        },
    }
)

export interface TypographyProps
    extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
    as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, color, as, ...props }, ref) => {
        const Component = as || getDefaultTag(variant)

        return (
            <Component
                className={cn(typographyVariants({ variant, color }), className)}
                ref={ref as any}
                {...props}
            />
        )
    }
)
Typography.displayName = "Typography"

function getDefaultTag(variant: TypographyProps["variant"]) {
    switch (variant) {
        case "h1":
            return "h1"
        case "h2":
            return "h2"
        case "h3":
            return "h3"
        case "h4":
            return "h4"
        case "h5":
            return "h5"
        case "h6":
            return "h6"
        case "blockquote":
            return "blockquote"
        case "ul":
            return "ul"
        case "ol":
            return "ol"
        case "code":
            return "code"
        default:
            return "p"
    }
}

export { Typography, typographyVariants }
