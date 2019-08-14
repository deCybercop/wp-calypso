/**
 * External dependencies
 */
import { isEmpty, isArray, noop } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';

export const TemplateSelectorControl = function( {
	templates = [],
	instanceId,
	label,
	onClick = noop,
	className,
	help,
} = {} ) {
	const id = `template-selector-control-${ instanceId }`;
	const handleButtonClick = event => onClick( event.target.value );

	if (
		isEmpty( label ) ||
		isEmpty( instanceId ) ||
		( isEmpty( templates ) || ! isArray( templates ) )
	) {
		return null;
	}

	return (
		<BaseControl
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector-control' ) }
		>
			<ul className="template-selector-control__options">
				{ templates.map( ( option, index ) => (
					<li key={ `${ id }-${ index }` } className="template-selector-control__option">
						<button
							type="button"
							id={ `${ id }-${ index }` }
							className="template-selector-control__label"
							value={ option.value }
							onClick={ handleButtonClick }
							aria-describedby={ help ? `${ id }__help` : undefined }
						>
							<div className="template-selector-control__media-wrap">
								{ option.preview && (
									<img
										className="template-selector-control__media"
										src={ option.preview }
										alt={ option.previewAlt || '' }
									/>
								) }
							</div>
							{ option.label }
						</button>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default withInstanceId( TemplateSelectorControl );
