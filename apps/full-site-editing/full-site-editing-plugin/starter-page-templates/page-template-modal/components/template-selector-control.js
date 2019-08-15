/**
 * External dependencies
 */
import { isEmpty, noop } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId, compose } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { memo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';

// Load config passed from backend.
const { siteInformation = {} } = window.starterPageTemplatesConfig;

const TemplateSelectorControl = ( {
	 label,
	 className,
	 help,
	 instanceId,
	 templates = [],
	 dynamicPreview = false,
	 blocksInPreview,
	 onTemplateSelect = noop,
	 onTemplateFocus = noop,
 } ) => {
	if ( isEmpty( templates ) ) {
		return null;
	}

	const id = `template-selector-control-${instanceId}`;

	return (
		<BaseControl
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector-control' ) }
		>
			<ul className="template-selector-control__options">
				{ templates.map( ( { slug, title, content, preview, previewAlt, value } ) => (
					<li key={ `${id}-${value}` } className="template-selector-control__template">
						<TemplateSelectorItem
							id={ id }
							value={ slug }
							label={ replacePlaceholders( title, siteInformation ) }
							help={ help }
							onSelect={ onTemplateSelect }
							onFocus={ onTemplateFocus }
							preview={ preview }
							previewAlt={ previewAlt }
							rawContent={ content }
							dynamicPreview={ dynamicPreview }
							blocksInPreview={ blocksInPreview }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default compose(
	memo,
	withInstanceId
)( TemplateSelectorControl );
