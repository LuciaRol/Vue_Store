const app = Vue.createApp({
    data() {
        return {
            searchTerm: '',
            selectedCategory: '',
            loading: false,
            error: '',
            products: [],
            categories: [],
            selectedProductIndex: null,
            selectedProducts: [],
            showCart: false,
            sortBy: 'default', // Nueva propiedad para la opción de ordenamiento
            
        };
    },
    computed: {
        filteredProducts() {
            if (!this.selectedCategory) {
                return this.products;
            }
            return this.products.filter(product => product.category === this.selectedCategory);
        },
        selectedProduct() {
            if (this.selectedProductIndex !== null && this.products.length > 0) {
                return this.products[this.selectedProductIndex];
            }
            return null;
        },
        totalCartPrice() {
            return this.selectedProducts.reduce((total, product) => total + product.price, 0);
        },
        sortedProducts() {
            let sorted = [...this.filteredProducts];
        
            if (this.sortBy === 'asc') {
                sorted.sort((a, b) => a.price - b.price);
            } else if (this.sortBy === 'desc') {
                sorted.sort((a, b) => b.price - a.price);
            } else if (this.sortBy === 'alpha asc') { 
                sorted.sort((a, b) => a.title.localeCompare(b.title));
            }
            else if (this.sortBy === 'alpha desc') { 
                sorted.sort((a, b) => b.title.localeCompare(a.title));
            }
        
            return sorted;
        },
    },
    methods: {
        sortProducts() {
            if (this.products.length > 0) {
                this.products = this.sortedProducts;
            }
        },
        search() {
            this.loading = true;
            this.error = '';
            this.clearSelectedProduct();
            this.fetchProducts();
        },
        async fetchProducts() {
            try {
                const response = await fetch('https://fakestoreapi.com/products');
                const data = await response.json();

                if (this.searchTerm || this.selectedCategory) {
                    this.products = data.filter(product => {
                        const titleMatch = !this.searchTerm || product.title.toLowerCase().includes(this.searchTerm.toLowerCase());
                        const categoryMatch = !this.selectedCategory || product.category === this.selectedCategory;
                        return titleMatch && categoryMatch;
                    });
                } else {
                    this.products = data;
                }

                if (this.products.length === 0 && this.categories.length > 0) {
                    this.viewMore(0);
                }

            } catch (error) {
                this.error = 'Error al obtener productos. Por favor, inténtalo de nuevo.';
            } finally {
                this.loading = false;
            }
        },
        async fetchCategories() {
            try {
                const response = await fetch('https://fakestoreapi.com/products/categories');
                this.categories = await response.json();
            } catch (error) {
                console.error('Error al obtener categorías:', error);
            }
        },
        saveCartToLocalStorage() {
            localStorage.setItem('cart', JSON.stringify(this.selectedProducts));
        },

        viewMore(index) {
            if (index >= 0 && index < this.filteredProducts.length) {
                this.selectedProductIndex = index;
            }
        },
        loadCartFromLocalStorage() {
            const cart = localStorage.getItem('cart');
            if (cart) {
                this.selectedProducts = JSON.parse(cart);
            }
        },
        clearSelectedProduct() {
            this.selectedProductIndex = null;
        },
        clearSearch() {
            this.searchTerm = '';
            this.selectedCategory = '';
            this.selectedProductIndex = null;
            this.selectedProducts = [];
            this.products = [];
        },
        buyProduct(index) {
            const productToAdd = this.filteredProducts[index];
            this.selectedProducts.push(productToAdd);
            this.saveCartToLocalStorage();
        },
        removeFromCart(index) {
            this.selectedProducts.splice(index, 1);
            this.saveCartToLocalStorage();
        },
        completePurchase() {
            this.selectedProducts = [];
            this.saveCartToLocalStorage();
            alert('Successful purchase!');
        },
        toggleCart() {
            this.showCart = !this.showCart;
        },
        closeCart() {
            this.showCart = false;
        },
        setCategoryFilter(category) {
            this.selectedCategory = category;
            this.search(); //esto lanza la búsqueda automáticamente
        },
    },
    async mounted() {
        await this.fetchCategories();
        this.loadCartFromLocalStorage();
    }
});

app.mount('#app');
