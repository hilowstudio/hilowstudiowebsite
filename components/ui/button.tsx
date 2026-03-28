import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    // Base styles - all buttons
    [
        "inline-flex items-center justify-center gap-2",
        "font-medium text-sm",
        "rounded-md",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        // Minimum touch target
        "min-h-11 px-6",
    ],
    {
        variants: {
            variant: {
                primary: [
                    "bg-clay text-paper",
                    "hover:bg-clay-muted",
                    "shadow-sm hover:shadow-md",
                ],
                secondary: [
                    "bg-transparent text-ink",
                    "border border-ink/20",
                    "hover:border-ink/40 hover:bg-ink/5",
                ],
                ghost: [
                    "bg-transparent text-ink-muted",
                    "hover:text-ink hover:bg-ink/5",
                ],
            },
            size: {
                sm: "min-h-9 px-4 text-xs",
                md: "min-h-11 px-6 text-sm",
                lg: "min-h-12 px-8 text-base",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
