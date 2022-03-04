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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _appendContent = () => {};

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

    this._preview.$ul.removeClass('is-hidden');

    // Get the file icon. // !!
    // window.api.fs.getFileIcon(this._file)
    //   .then(dataUrl => {});

    this._preview.$ul.removeClass('is-hidden')
      .find('>li>a').first().text(window.api.path.basename(this._file));

    if (this._appendContent() === null)
    {
      this._$previewContent.html('<div class="content"><p>Preview not available.</p></div>');

      return false;
    }

    return true;
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

    if (/\.(jpe?g|png|gif|bmp)$/iu.test(ext))
    {
      this._appendContent = () =>
      {
        this._$previewContent.append($(document.createElement('img'))
          .attr('src', (new URL(this._file)).href));
      };
    }
    else
    {
      switch (ext)
      {
        case '.txt':
        {
          this._appendContent = () => null;

          break;
        }
        case '.pdf':
        {
          const pdfjsVersion = '2.13.216'; // hardcoded !!

          const pdfjs = window.api.path.join(window.api.ABSPATH, `ext_modules/pdfjs-${pdfjsVersion}-dist/web/viewer.html`);

          const uriComponent = this.escapeURIComponent(this.file);

          console.log(`${(new URL(pdfjs)).href}`);

          this._appendContent = () =>
          {
            this._$previewContent.append($(document.createElement('iframe'))
              .attr('src', `${(new URL(pdfjs)).href}?file=file:///${uriComponent}`));
          };

          break;
        }
        default:
        {
          // custom filter !!
          this._appendContent = () => null;
        }
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