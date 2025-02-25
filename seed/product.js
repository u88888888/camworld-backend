const Gallery = require('../models/Gallery');
const Highlight = require('../models/Highlight');
const Spec = require('../models/Spec');
const Product = require('../models/Product');
const Description = require('../models/Description');
const {getCategory, createCategory} = require('./category');
const {getSubTaxonomy} = require('./taxonomy');
const {generateProductSlug} = require('../utils/helpers');

const self = module.exports = {
  async createProduct(dto) {
    let category = await getCategory({name: dto.category})
    if (!category) {
      category = await createCategory({name: dto.category})
    }
    const product = await Product.create({
      name: dto.name,
      slug: await generateProductSlug(dto.name, '/product/'),
      image: dto.image,
      description: dto.description,
      sku: dto.sku,
      youtubeEmbed: dto.youtubeEmbed,
      price: dto.price,
      categoryId: category.id,
      rating: dto.rating,
      numReviews: dto.numReviews,
    });
    if (dto.gallery) {
      for await (let item of dto.gallery) {
        await self.addNewGalleryImage({url: item, productId: product.id});
      }
    }
    if (dto.highlights) {
      for await (let item of dto.highlights) {
        await self.addNewHighlight({name: item, productId: product.id});
      }
    }
    if (dto.specs) {
      for await (let item of dto.specs) {
        await self.addNewSpec(
          {key: item.key, value: item.value, productId: product.id});
      }
    }
    if (dto.subTaxonomy) {
      for await (let item of dto.subTaxonomy) {
        const subTaxonomy = await getSubTaxonomy({name: item.name, taxonomy: item.taxonomy})
        await product.addSubTaxonomy(subTaxonomy.id);
      }
    }
    if (dto.description) {
      for await (let item of dto.description) {
        await self.addDescription(
          {title: item.title, value: item.value, productId: product.id}
        )
      }
    }
  },

  async addNewGalleryImage(dto) {
    return await Gallery.create({
      url: dto.url,
      productId: dto.productId,
    });
  },

  async addNewHighlight(dto) {
    return await Highlight.create({
      name: dto.name,
      productId: dto.productId,
    });
  },

  async addNewSpec(dto) {
    return await Spec.create({
      key: dto.key,
      value: dto.value,
      productId: dto.productId,
    });
  },

  async addDescription(dto) {
    return await Description.create({
      title: dto.title,
      value: dto.value,
      productId: dto.productId,
    });
  },
}