const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-light tracking-tight">
              Ready to build
            </h1>
            <p className="text-xl text-text-subtle max-w-lg mx-auto leading-relaxed">
              Your clean canvas awaits. Start creating something beautiful.
            </p>
          </div>
          
          <div className="w-16 h-px bg-border mx-auto"></div>
          
          <div className="text-sm text-text-subtle">
            Begin by describing what you'd like to create
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
