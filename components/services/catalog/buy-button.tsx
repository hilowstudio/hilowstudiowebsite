interface BuyButtonProps {
    stripeUrl: string;
    label: string;
}

export function BuyButton({ stripeUrl, label }: BuyButtonProps) {
    return (
        <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
        >
            {label}
        </a>
    );
}
