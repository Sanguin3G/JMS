import { Bold, Essentials, Heading, Italic, Link, List, Paragraph, type EditorConfig } from 'ckeditor5';

export function editorConfig(placeholder: string): EditorConfig {
  return {
    // Self-hosted open-source demo mode; a commercial host can supply its key.
    licenseKey: window.JMS_CONFIG?.ckeditorLicenseKey || 'GPL',
    plugins: [Essentials, Paragraph, Bold, Italic, Link, List, Heading],
    toolbar: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList'],
    placeholder,
  };
}
