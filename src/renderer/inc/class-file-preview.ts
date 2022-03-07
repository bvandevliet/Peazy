import Tabs from './class-tabs.js';
import * as html from './functions-html.js';

/**
 * A wrapper class to handle html for table lists.
 */
export default class FilePreview
{
  private _file: string = null;

  /**
   * The File Preview element.
   * This is the element you want to add to the DOM.
   */
  readonly $preview: JQuery<HTMLDivElement>;

  /**
   * File Preview uses a `Tabs` instance on the background.
   */
  private readonly _preview: Tabs;

  /**
   * The actual file preview content.
   */
  private readonly _$previewContent = $(html.getTemplateClone('tmpl-entry-content')) as JQuery<HTMLDivElement>;

  /**
   * The file being previewed.
   */
  get file ()
  {
    return this._file;
  }

  private _content = (): JQuery<any> => null;

  /**
   * Escape a string to use in a URI query argument.
   *
   * @param input The string.
   */
  escapeURIComponent = (input: string) =>
  {
    return encodeURIComponent(
      input
        .replace(/\\/gu, '/')
        .replace(/%/gu, '%25')
        // .replace(/\//g, '%2F')
        // .replace(/ /g, '%20')
        .replace(/\?/gu, '%3F')
        .replace(/:/gu, '%3A')
        .replace(/@/gu, '%40')
        .replace(/&/gu, '%26')
        .replace(/=/gu, '%3D')
        .replace(/\+/gu, '%2B')
        .replace(/\$/gu, '%24')
        .replace(/#/gu, '%23'),
    );
  };

  private empty ()
  {
    this._$previewContent.empty();

    this._preview.$ul.addClass('is-hidden');

    // Collect garbage.
    window.gc();
    window.api.gc();
  }

  close ()
  {
    this._file = null;

    this.empty();

    this._preview.$ul.find('>li>a').first().text('');
  }

  /**
   * Refresh the current preview.
   */
  refresh (): boolean
  {
    this.empty();

    if (!window.api.fs.existsSync(this._file)) return false;

    // Get the file icon. // !!
    // window.api.fs.getFileIcon(this._file)
    //   .then(dataUrl => {});

    this._preview.$ul.removeClass('is-hidden')
      .find('>li>a').first().text(window.api.path.basename(this._file));

    const $content = this._content();

    this._$previewContent
      .append($content ?? '<div class="content"><p>Preview not available.</p></div>');

    return $content !== null;
  }

  /**
   * Preview a given file.
   *
   * @param file Full path to the file.
   */
  preview (file: string)
  {
    this._file = window.api.path.normalize(file);

    this.empty();

    const ext = window.api.path.extname(this._file);

    switch (ext)
    {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.bmp':
      {
        this._content = () =>
        {
          return $(document.createElement('img'))
            .attr('src', (new URL(this._file)).href);
        };

        break;
      }
      case '.txt':
      case '.log':
      case '.cmd':
      case '.bat':
      case '.ps1':
      case '.psd1':
      case '.psm1':
      {
        const $contentElem = $(document.createElement('p')).addClass('pre-wrap');

        this._content = () =>
        {
          (new File([this._file], window.api.path.basename(this._file)))
            .text()
            .then(result => $contentElem.text(result));

          return $contentElem;
        };

        break;
      }
      case '.json':
      case '.xml':
      case '.html':
      {
        const $iframe = $(document.createElement('iframe'));

        this._content = () =>
        {
          return $iframe.attr('src', (new URL(this.file)).href);
        };

        break;
      }
      case '.pdf':
      {
        const pdfjsVersion = '2.13.216'; // hardcoded !!

        const pdfjs = window.api.path.join(window.api.ABSPATH, `ext_modules/pdfjs-${pdfjsVersion}-dist/web/viewer.html`);

        const $iframe = $(document.createElement('iframe'));

        this._content = () =>
        {
          const uriComponent = this.escapeURIComponent(this.file);

          return $iframe.attr('src', `${(new URL(pdfjs)).href}?file=file:///${uriComponent}`);
        };

        break;
      }
      default:
      {
        // Filter for custom file preview support.
        this._content = () => window.api.hooks.applyFilters('file_preview_content', null, this._file, ext);
      }
    }

    return this.refresh();
  }

  /**
   *
   * @param onClose Called when closing the preview.
   */
  constructor (onClose?: () => void)
  {
    this._preview = new Tabs();
    this.$preview = this._preview.$container;

    this._preview.$ul.addClass('is-hidden');

    // Create new tab.
    const { $li } = this._preview.addTab({
      id: null,
      template: 'tmpl-li-file-preview',
      title: 'Click to open file',
      callback: $div => $div.append(this._$previewContent).removeClass('is-hidden'),
      onclick: () =>
      {
        // Never activate the tab, only perform an action.
        return new Promise(resolve => (window.api.fs.openNative(this._file), resolve(false)));
      },
      onmiddleclick: $li => $li.find('>a.close-btn').first().trigger('click'),
    },
    // Don't activate the tab.
    false);

    // Configure the "refresh" button.
    $li.find('>a.refresh-btn').on('click', () =>
    {
      this.refresh();
    });

    // Configure the "close" button.
    $li.find('>a.close-btn').on('click', () =>
    {
      this.close();

      if (typeof onClose === 'function') onClose();
    });
  }
}