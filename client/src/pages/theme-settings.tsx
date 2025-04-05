import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Theme, 
  defaultTheme, 
  loadTheme, 
  saveTheme as saveThemeToStorage, 
  applyTheme,
  fontOptions
} from "@/lib/theme-manager";

export default function ThemeSettings() {
  // Initialize with loaded theme or default theme
  const [theme, setTheme] = useState<Theme>(loadTheme());

  // Save theme to localStorage and update live theme
  const saveTheme = () => {
    try {
      // Save theme to storage and apply to DOM
      saveThemeToStorage(theme);
      applyTheme(theme);
      
      toast({
        title: "Theme Updated",
        description: "Your changes have been applied to the application.",
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error",
        description: "Failed to save theme changes.",
        variant: "destructive"
      });
    }
  };

  // Reset to default theme
  const resetTheme = () => {
    setTheme({...defaultTheme});
    
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default values.",
    });
  };

  // Update a specific color in the theme
  const updateColor = (key: keyof Theme['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
  };

  // Update a specific font in the theme
  const updateFont = (key: keyof Theme['fonts'], value: string) => {
    setTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [key]: value
      }
    }));
  };

  // Generate a preview style object for elements
  const generatePreviewStyle = (color: string, textColor: string = '#ffffff') => ({
    backgroundColor: color,
    color: textColor,
    padding: '2rem',
    borderRadius: `${theme.radius * 0.5}rem`,
    fontFamily: theme.fonts.body
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Theme Settings</h1>
      
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Brand Colors</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color (Main Brand Color)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={theme.primary}
                        onChange={(e) => setTheme({...theme, primary: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.primary}
                        onChange={(e) => setTheme({...theme, primary: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color (Green Theme)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={theme.colors.secondary}
                        onChange={(e) => updateColor('secondary', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.secondary}
                        onChange={(e) => updateColor('secondary', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color (Headings & Emphasis)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={theme.colors.accent}
                        onChange={(e) => updateColor('accent', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.accent}
                        onChange={(e) => updateColor('accent', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Semantic Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Semantic Colors</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="success-color">Success</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="success-color"
                        type="color"
                        value={theme.colors.success}
                        onChange={(e) => updateColor('success', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.success}
                        onChange={(e) => updateColor('success', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="warning-color">Warning</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="warning-color"
                        type="color"
                        value={theme.colors.warning}
                        onChange={(e) => updateColor('warning', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.warning}
                        onChange={(e) => updateColor('warning', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="error-color">Error</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="error-color"
                        type="color"
                        value={theme.colors.error}
                        onChange={(e) => updateColor('error', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.error}
                        onChange={(e) => updateColor('error', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="info-color">Information</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="info-color"
                        type="color"
                        value={theme.colors.info}
                        onChange={(e) => updateColor('info', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.info}
                        onChange={(e) => updateColor('info', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* UI Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">UI Colors</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Page Background</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={theme.colors.background}
                        onChange={(e) => updateColor('background', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.background}
                        onChange={(e) => updateColor('background', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="foreground-color">Text Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="foreground-color"
                        type="color"
                        value={theme.colors.foreground}
                        onChange={(e) => updateColor('foreground', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.foreground}
                        onChange={(e) => updateColor('foreground', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="card-color">Card Background</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="card-color"
                        type="color"
                        value={theme.colors.card}
                        onChange={(e) => updateColor('card', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.card}
                        onChange={(e) => updateColor('card', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="card-foreground-color">Card Text Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="card-foreground-color"
                        type="color"
                        value={theme.colors.cardForeground}
                        onChange={(e) => updateColor('cardForeground', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.cardForeground}
                        onChange={(e) => updateColor('cardForeground', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="border-color">Border Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="border-color"
                        type="color"
                        value={theme.colors.border}
                        onChange={(e) => updateColor('border', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.border}
                        onChange={(e) => updateColor('border', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="muted-color">Muted Background</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="muted-color"
                        type="color"
                        value={theme.colors.muted}
                        onChange={(e) => updateColor('muted', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={theme.colors.muted}
                        onChange={(e) => updateColor('muted', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heading Font */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Heading Font</h3>
                  <Select 
                    value={theme.fonts.heading}
                    onValueChange={(value) => updateFont('heading', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Font Preview */}
                  <div className="space-y-4 border rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Preview:</p>
                    <h1 className="text-4xl" style={{ fontFamily: theme.fonts.heading }}>
                      Heading 1
                    </h1>
                    <h2 className="text-3xl" style={{ fontFamily: theme.fonts.heading }}>
                      Heading 2
                    </h2>
                    <h3 className="text-2xl" style={{ fontFamily: theme.fonts.heading }}>
                      Heading 3
                    </h3>
                    <h4 className="text-xl" style={{ fontFamily: theme.fonts.heading }}>
                      Heading 4
                    </h4>
                  </div>
                </div>
                
                {/* Body Font */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Body Font</h3>
                  <Select 
                    value={theme.fonts.body}
                    onValueChange={(value) => updateFont('body', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Font Preview */}
                  <div className="space-y-4 border rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Preview:</p>
                    <p className="text-base" style={{ fontFamily: theme.fonts.body }}>
                      This is a paragraph of text that demonstrates the body font. The quick brown fox jumps over the lazy dog.
                    </p>
                    <p className="text-sm" style={{ fontFamily: theme.fonts.body }}>
                      This is a smaller paragraph that shows how the font looks at a smaller size. The five boxing wizards jump quickly.
                    </p>
                    <p className="text-xs" style={{ fontFamily: theme.fonts.body }}>
                      This is very small text, useful for captions or footnotes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Theme Variant */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Theme Variant</h3>
                  <RadioGroup 
                    className="grid grid-cols-3 gap-4"
                    value={theme.variant}
                    onValueChange={(value: 'professional' | 'tint' | 'vibrant') => 
                      setTheme({...theme, variant: value})
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tint" id="tint" />
                      <Label htmlFor="tint">Tint</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vibrant" id="vibrant" />
                      <Label htmlFor="vibrant">Vibrant</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Color Mode */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Color Mode</h3>
                  <RadioGroup 
                    className="grid grid-cols-3 gap-4"
                    value={theme.appearance}
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      setTheme({...theme, appearance: value})
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Border Radius */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Border Radius</h3>
                    <span className="text-sm text-muted-foreground">{theme.radius.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[theme.radius]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={(values) => setTheme({...theme, radius: values[0]})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Square</span>
                    <span>Rounded</span>
                    <span>Pill</span>
                  </div>
                  
                  {/* Preview */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div 
                      className="h-16 bg-primary flex items-center justify-center text-white"
                      style={{ borderRadius: `${theme.radius * 0.5}rem` }}
                    >
                      Button
                    </div>
                    <div 
                      className="h-16 bg-secondary flex items-center justify-center text-white"
                      style={{ borderRadius: `${theme.radius * 0.5}rem` }}
                    >
                      Card
                    </div>
                    <div 
                      className="h-16 bg-accent flex items-center justify-center text-white"
                      style={{ borderRadius: `${theme.radius * 0.5}rem` }}
                    >
                      Input
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Brand Colors Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Brand Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      style={generatePreviewStyle(theme.primary)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Primary</p>
                      <p className="text-sm text-center mt-2">{theme.primary}</p>
                    </div>
                    <div 
                      style={generatePreviewStyle(theme.colors.secondary)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Secondary</p>
                      <p className="text-sm text-center mt-2">{theme.colors.secondary}</p>
                    </div>
                    <div 
                      style={generatePreviewStyle(theme.colors.accent)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Accent</p>
                      <p className="text-sm text-center mt-2">{theme.colors.accent}</p>
                    </div>
                  </div>
                </div>
                
                {/* Semantic Colors Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Semantic Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div 
                      style={generatePreviewStyle(theme.colors.success)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Success</p>
                      <p className="text-sm text-center mt-2">{theme.colors.success}</p>
                    </div>
                    <div 
                      style={generatePreviewStyle(theme.colors.warning)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Warning</p>
                      <p className="text-sm text-center mt-2">{theme.colors.warning}</p>
                    </div>
                    <div 
                      style={generatePreviewStyle(theme.colors.error)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Error</p>
                      <p className="text-sm text-center mt-2">{theme.colors.error}</p>
                    </div>
                    <div 
                      style={generatePreviewStyle(theme.colors.info)}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="font-bold text-center">Info</p>
                      <p className="text-sm text-center mt-2">{theme.colors.info}</p>
                    </div>
                  </div>
                </div>
                
                {/* UI Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">UI Components Preview</h3>
                  
                  {/* Card Preview */}
                  <div className="border p-6 rounded-lg" style={{ 
                    backgroundColor: theme.colors.card, 
                    color: theme.colors.cardForeground,
                    borderColor: theme.colors.border,
                    borderRadius: `${theme.radius * 0.5}rem`
                  }}>
                    <h4 className="text-xl font-semibold mb-4" style={{ fontFamily: theme.fonts.heading }}>
                      Sample Card
                    </h4>
                    <p className="mb-4" style={{ fontFamily: theme.fonts.body }}>
                      This is a preview of how cards will look with your selected theme.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        style={{ 
                          backgroundColor: theme.primary,
                          borderRadius: `${theme.radius * 0.25}rem`,
                          fontFamily: theme.fonts.body
                        }}
                      >
                        Primary Button
                      </Button>
                      <Button 
                        style={{ 
                          backgroundColor: theme.colors.secondary,
                          borderRadius: `${theme.radius * 0.25}rem`,
                          fontFamily: theme.fonts.body
                        }}
                      >
                        Secondary Button
                      </Button>
                      <Button 
                        variant="outline"
                        style={{ 
                          borderColor: theme.colors.border,
                          color: theme.colors.foreground,
                          borderRadius: `${theme.radius * 0.25}rem`,
                          fontFamily: theme.fonts.body
                        }}
                      >
                        Outline Button
                      </Button>
                    </div>
                  </div>
                  
                  {/* Form Preview */}
                  <div className="border p-6 rounded-lg" style={{ 
                    backgroundColor: theme.colors.background, 
                    color: theme.colors.foreground,
                    borderColor: theme.colors.border,
                    borderRadius: `${theme.radius * 0.5}rem`,
                    fontFamily: theme.fonts.body
                  }}>
                    <h4 className="text-xl font-semibold mb-4" style={{ fontFamily: theme.fonts.heading }}>
                      Form Example
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sample-input">Sample Input</Label>
                        <Input 
                          id="sample-input" 
                          placeholder="Enter text here" 
                          style={{ 
                            borderColor: theme.colors.border,
                            borderRadius: `${theme.radius * 0.25}rem`
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sample-select">Sample Dropdown</Label>
                        <Select>
                          <SelectTrigger 
                            style={{ 
                              borderColor: theme.colors.border,
                              borderRadius: `${theme.radius * 0.25}rem`
                            }}
                          >
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                            <SelectItem value="option3">Option 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        className="mt-4"
                        style={{ 
                          backgroundColor: theme.primary,
                          borderRadius: `${theme.radius * 0.25}rem`
                        }}
                      >
                        Submit Form
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={resetTheme}>
          Reset to Default
        </Button>
        <Button 
          onClick={saveTheme}
          className="bg-[#a3b68a] hover:bg-[#a3b68a]/90 text-white"
        >
          Apply Theme Settings
        </Button>
      </div>
    </div>
  );
}