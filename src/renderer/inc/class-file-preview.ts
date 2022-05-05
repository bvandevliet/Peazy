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

  private _content = (): Promise<string|JQuery<any>> => null;

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
  async refresh (): Promise<boolean>
  {
    // Assume failure.
    let result = false;

    this.empty();

    const $a = this._preview.$ul.removeClass('is-hidden').find('>li>a').first();

    $a.text(window.api.path.basename(this._file));

    // <div class="is-file-icon"><img draggable="false" /></div>

    if (window.api.fs.existsSync(this._file))
    {
      const $fileIcon = $('<img draggable="false" />');
      $a.prepend($('<div class="is-file-icon"/>').append($fileIcon));

      // Get the file icon.
      window.api.fs.getFileIcon(this._file)
        .then(dataUrl => $fileIcon.attr('src', dataUrl));

      const $content = await this._content(); // .catch(err => (console.error(err), null));

      if ($content !== null)
      {
        typeof $content === 'string'
          ? this._$previewContent.html($content)
          : this._$previewContent.append($content);

        result = true;
      }
      else
      {
        this._$previewContent
          .html('<div class="content"><p>Preview not available.</p></div>');
      }
    }
    else
    {
      this._$previewContent
        .html('<div class="content"><p>File does not exist.</p></div>');
    }

    return result;
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

    const ext = window.api.path.extname(this._file).toLowerCase();

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
          return new Promise(resolve =>
            resolve($(document.createElement('img'))
              .attr('src', window.api.core.escapeURI(`file:///${this.file}`))));
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
      case '.json':
      case '.xml':
      case '.html':
      {
        const $iframe = $(document.createElement('iframe'));

        this._content = () =>
        {
          return new Promise(resolve =>
            resolve($iframe.attr('src', window.api.core.escapeURI(`file:///${this.file}`))));
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
          return new Promise(resolve =>
            resolve($iframe.attr('src', window.api.core.escapeURI(`file:///${pdfjs}`, { file: `file:///${this.file}` }))));
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

    this._preview.$ul.addClass(['is-fullwidth', 'is-hidden']);

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
      // html.loading();
      this.refresh();
      // .finally(() => html.loading(false));
    });

    // Configure the "close" button.
    $li.find('>a.close-btn').on('click', () =>
    {
      this.close();

      if (typeof onClose === 'function') onClose();
    });
  }
}