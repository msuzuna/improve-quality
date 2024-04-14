import nested from "postcss-nested";
import atImport from "postcss-import";
import postcssMixins from "postcss-mixins";
import postcssExtendRule from "postcss-extend-rule";
import autoprefixer from "autoprefixer";

export default {
  plugins: [nested, atImport, postcssMixins, postcssExtendRule, autoprefixer],
};
