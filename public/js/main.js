const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const productList = document.getElementById('productsContainer');

    // Función para recuperar o crear un carrito en la base de datos
    const getOrCreateCart = async () => {
        try {
            const response = await fetch('/api/carts', { method: 'POST' });
            const data = await response.json();
            return data._id;
        } catch (error) {
            console.error('Error al crear o recuperar el carrito:', error);
            return null;
        }
    };

    // Manejar la creación de productos
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const productData = {};
            formData.forEach((value, key) => {
                productData[key] = value;
            });

            if (formData.get('productImage')) {
                const reader = new FileReader();
                reader.readAsDataURL(formData.get('productImage'));
                reader.onload = function () {
                    productData.image = reader.result;
                    socket.emit('addProduct', productData);
                };
            } else {
                socket.emit('addProduct', productData);
            }

            event.target.reset();
        });

        productList.addEventListener('click', async (event) => {
            if (event.target.classList.contains('deleteBtn')) {
                const productId = event.target.getAttribute('data-id');

                fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Producto eliminado exitosamente');
                        socket.emit('deleteProduct', productId);
                    } else {
                        alert('Error al eliminar el producto');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el producto:', error);
                    alert('Ocurrió un error al intentar eliminar el producto');
                });
            }
        });
    }

    // Manejar la acción de agregar al carrito
    if (productList) {
        productList.addEventListener('click', async (event) => {
            if (event.target.classList.contains('addToCartBtn')) {
                const productId = event.target.getAttribute('data-id');

                const cartId = await getOrCreateCart();

                if (cartId) {
                    fetch(`/api/carts/${cartId}/products/${productId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ quantity: 1 })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            alert('Producto añadido al carrito exitosamente');
                        } else {
                            alert('Error al añadir el producto al carrito');
                        }
                    })
                    .catch(error => {
                        console.error('Error al añadir el producto al carrito:', error);
                        alert('Ocurrió un error al intentar añadir el producto al carrito');
                    });
                } else {
                    alert('Error: No se pudo crear o recuperar el carrito');
                }
            }
        });
    }

    // Actualizar la lista de productos en tiempo real
    socket.on('updateProducts', (products) => {
        if (productList) {
            productList.innerHTML = '';
            if (Array.isArray(products)) {
                products.forEach(product => {
                    const productDiv = document.createElement('div');
                    productDiv.classList.add('product');
                    productDiv.innerHTML = `
                        <h3>${product.title}</h3>
                        <button class="deleteBtn" data-id="${product._id}">Eliminar</button>`;
                    productList.appendChild(productDiv);
                });
            } else {
                console.error("Error: `products` no es un array", products);
            }
        }
    });

    socket.emit('requestProducts');
});
