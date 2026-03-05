import Navbar from '@/components/Navbar';
import AiShopperChat from '@/components/AiShopperChat';

export const metadata = {
    title: 'AI Craft Shopper — KarigarSetu',
    description: 'Describe what you want and let AI find the perfect handcrafted products for you.',
};

export default function AiShopperPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <AiShopperChat />
        </div>
    );
}
