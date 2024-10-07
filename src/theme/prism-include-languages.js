import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';

const prismIncludeLanguages = (PrismObject) => {
  if (ExecutionEnvironment.canUseDOM) {
    const {
      themeConfig: { prism = {} },
    } = siteConfig;
    const { additionalLanguages = [] } = prism;

    window.Prism = PrismObject;

    additionalLanguages.forEach((lang) => {
      try {
        require(`prismjs/components/prism-${lang}`);
      } catch (error) {
        console.error(`Prism language '${lang}' could not be loaded.`, error);
      }
    });

    try {
      require('../aiken.prism.lang.js');
    } catch (error) {
      console.error('Custom Prism language could not be loaded.', error);
    }

    delete window.Prism;
  }
};

export default prismIncludeLanguages;