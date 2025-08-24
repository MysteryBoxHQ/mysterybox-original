import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface DynamicLegalPageProps {
  slug: string;
}

export default function DynamicLegalPage({ slug }: DynamicLegalPageProps) {
  const { data: page, isLoading, error } = useQuery({
    queryKey: [`/api/legal/${slug}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
            <p className="text-gray-300 mb-6">
              The requested legal page could not be found or is currently unavailable.
            </p>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Convert markdown-like content to HTML-like formatting
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-semibold text-white mb-3 mt-6">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-white mb-2 mt-4">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter(line => line.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside space-y-1 mb-4 text-gray-300">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace('- ', '')}</li>
              ))}
            </ul>
          );
        }
        if (paragraph.trim()) {
          return (
            <p key={index} className="text-gray-300 mb-4 leading-relaxed">
              {paragraph}
            </p>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
          
          {page.metaDescription && (
            <p className="text-gray-400 mb-8 text-lg">{page.metaDescription}</p>
          )}
          
          <div className="space-y-6">
            {formatContent(page.content)}
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-sm">
              Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}