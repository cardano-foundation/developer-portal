import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';
const prismIncludeLanguages = (PrismObject) => {
  if (ExecutionEnvironment.canUseDOM) {
    const {
      themeConfig: {prism = {}},
    } = siteConfig;
    const {additionalLanguages = []} = prism;
    window.Prism = PrismObject;
    additionalLanguages.forEach((lang) => 
      require(`prismjs/components/prism-${lang}`)
    );
    window.x = require('../aiken.prism.lang.js');
    delete window.Prism;
  }
};

export default prismIncludeLanguages;
