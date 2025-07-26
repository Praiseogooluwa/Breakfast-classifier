import BreakfastClassifier from '@/components/BreakfastClassifier';
import { Heart, Github, Linkedin, Twitter } from 'lucide-react';

const Index = () => {
  return (
    <>
      <BreakfastClassifier />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 backdrop-blur-xl bg-card/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-muted-foreground">Built with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-muted-foreground">by</span>
              <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Praise Ogooluwa
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Connect with me:</span>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://github.com/Praiseogooluwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:shadow-glow hover:scale-110 transition-all duration-300"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/in/praise-ogooluwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:shadow-glow hover:scale-110 transition-all duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:shadow-glow hover:scale-110 transition-all duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2025 Breakfast Classifier. Powered by Machine Learning. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;
