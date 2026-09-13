/* SPC FlexC Card container-responsive layout. */

const spcFlexCResponsiveBaseStyles = SpcFlexCCard.prototype._styles;

SpcFlexCCard.prototype._styles = function () {
  return `${spcFlexCResponsiveBaseStyles.call(this)}
    <style>
      .card {
        container-type: inline-size;
        container-name: spc-flexc-card;
      }

      .area-list,
      .door-list,
      .output-list,
      .technical-system-view {
        grid-template-columns: 1fr;
      }

      .technical-row {
        grid-template-columns: 1fr;
        gap: 2px;
      }

      .technical-value {
        text-align: left;
      }

      .xbus-card,
      .ats-card,
      .atp-card,
      .door-card,
      .output-row,
      .area-card {
        min-width: 0;
      }

      @container spc-flexc-card (min-width: 1050px) {
        .area-list,
        .door-list,
        .output-list,
        .technical-system-view {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .technical-row {
          grid-template-columns: minmax(130px, 0.7fr) minmax(0, 1.3fr);
          gap: 14px;
        }

        .technical-value {
          text-align: right;
        }
      }
    </style>`;
};
