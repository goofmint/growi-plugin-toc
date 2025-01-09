import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';

import config from './package.json';
import { Options, Func, ViewOptions } from './types/utils';

declare const growiFacade : {
  markdownRenderer?: {
    optionsGenerators: {
      customGenerateViewOptions: (path: string, options: Options, toc: Func) => ViewOptions,
      generateViewOptions: (path: string, options: Options, toc: Func) => ViewOptions,
      generatePreviewOptions: (path: string, options: Options, toc: Func) => ViewOptions,
      customGeneratePreviewOptions: (path: string, options: Options, toc: Func) => ViewOptions,
    },
  },
};

const activate = (): void => {
  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    return;
  }
  const heading = '(table[ -]of[ -])?contents?|toc|目次|目录';
  const { optionsGenerators } = growiFacade.markdownRenderer;
  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  optionsGenerators.customGenerateViewOptions = (...args) => {
    const options = originalCustomViewOptions ? originalCustomViewOptions(...args) : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins.push([remarkToc, { heading }] as any);
    options.rehypePlugins.push(rehypeSlug as any);
    return options;
  };

  // For preview
  const originalGeneratePreviewOptions = optionsGenerators.customGeneratePreviewOptions;
  optionsGenerators.customGeneratePreviewOptions = (...args) => {
    const preview = originalGeneratePreviewOptions ? originalGeneratePreviewOptions(...args) : optionsGenerators.generatePreviewOptions(...args);
    preview.remarkPlugins.push([remarkToc, { heading }] as any);
    preview.rehypePlugins.push(rehypeSlug as any);
    return preview;
  };
};

const deactivate = (): void => {
};

// register activate
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators[config.name] = {
  activate,
  deactivate,
};
