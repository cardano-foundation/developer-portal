import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';

const prismIncludeLanguages = (PrismObject) => {
  if (ExecutionEnvironment.canUseDOM) {
    const {
      themeConfig: {prism = {}},
    } = siteConfig;
    const {additionalLanguages = []} = prism;
    window.Prism = PrismObject;

    additionalLanguages.forEach((lang) => {
      try {
        // Explicitly load 'markup-templating' for templating languages like PHP
        if (lang === 'php' || lang === 'some-other-templating-language') {
          require('prismjs/components/prism-markup-templating');
        }
        require(`prismjs/components/prism-${lang}`);
      } catch (error) {
        console.error(`Failed to load Prism language: ${lang}`, error);
      }
    });

    try {
      require('./prism-languages/aiken.js');
    } catch (error) {
      console.error('Failed to load custom Prism language: aiken', error);
    }

    delete window.Prism;
  }
};

export default prismIncludeLanguages;
