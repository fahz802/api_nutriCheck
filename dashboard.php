<?= $this->include('layouts/header') ?>
<?= $this->include('layouts/sidebar') ?>

<div class="flex-1 flex flex-col overflow-auto">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end">
            <div class="relative">
                <button id="userMenuButton"
                    class="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 rounded">
                    <img src="https://storage.googleapis.com/a1aa/image/f8df228e-6160-42a2-0665-9b60144fc1cb.jpg"
                        class="rounded-full w-8 h-8" alt="Admin profile" />
                    <span class="font-medium text-gray-700 hidden sm:block">Admin</span>
                    <i class="fas fa-chevron-down text-gray-500"></i>
                </button>
                <div id="userDropdown"
                    class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden">
                    <div class="py-1">
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100">
                            <i class="fas fa-cog mr-2"></i> Pengaturan Admin
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-3xl font-semibold text-gray-800 mb-8">Dashboard</h2>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center space-x-4">
                    <div class="p-3 rounded-full bg-green-100 text-green-700 text-2xl">
                        <i class="fas fa-box"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Total Produk</p>
                        <p class="text-2xl font-bold text-gray-900">
                            <?= $totalProducts ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center space-x-4">
                    <div class="p-3 rounded-full bg-yellow-100 text-yellow-700 text-2xl">
                        <i class="fas fa-download"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Stok Masuk Hari Ini</p>
                        <p class="text-2xl font-bold text-gray-900">
                            <?= $stockInToday ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center space-x-4">
                    <div class="p-3 rounded-full bg-red-100 text-red-700 text-2xl">
                        <i class="fas fa-upload"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Stok Keluar Hari Ini</p>
                        <p class="text-2xl font-bold text-gray-900">
                            <?= $stockOutToday ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center space-x-4">
                    <div class="p-3 rounded-full bg-blue-100 text-blue-700 text-2xl">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Total Pesanan</p>
                        <p class="text-2xl font-bold text-gray-900">
                            <?= $totalOrders ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <div class="bg-white rounded-lg shadow p-6 mb-10">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">5 Transaksi yang Perlu Diselesaikan</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-left">
                    <thead class="bg-gray-100 text-xs font-semibold text-gray-600 uppercase">
                        <tr>
                            <th class="px-4 py-2">#</th>
                            <th class="px-4 py-2">Tanggal</th>
                            <th class="px-4 py-2">Status</th>
                            <th class="px-4 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($pendingOrders)) : ?>
                        <?php foreach ($pendingOrders as $i => $order) : ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2"><?= $i + 1 ?></td>
                            <td class="px-4 py-2"><?= date('d/m/Y H:i', strtotime($order['created_at'])) ?></td>
                            <td class="px-4 py-2"><?= ucfirst($order['order_status']) ?></td>
                            <td class="px-4 py-2">
                                <a href="<?= base_url('public/admin/orders/detail/' . $order['id']) ?>"
                                    class="text-blue-600 hover:underline">Detail</a>
                            </td>
                        </tr>
                        <?php endforeach ?>
                        <?php else : ?>
                        <tr>
                            <td colspan="4" class="px-4 py-2 text-center text-gray-500">Tidak ada transaksi yang perlu
                                diselesaikan.</td>
                        </tr>
                        <?php endif ?>
                    </tbody>
                </table>
            </div>
        </div>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">5 Stok Terendah</h3>
                <ul class="divide-y divide-gray-200">
                    <?php foreach ($lowStocks ?? [] as $product): ?>
                    <li class="py-3">
                        <div class="flex justify-between">
                            <div>
                                <p class="font-semibold text-gray-800"><?= esc($product['name']) ?></p>
                                <p class="text-sm text-gray-500">Kategori: <?= esc($product['category_name'] ?? '-') ?>
                                </p>
                            </div>
                            <span class="text-red-600 font-semibold self-center"><?= $product['stock'] ?> pcs</span>
                        </div>
                    </li>
                    <?php endforeach ?>
                </ul>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Notifikasi Stok Minimum</h3>
                <ul class="divide-y divide-gray-200">
                    <?php foreach ($minStocks ?? [] as $product): ?>
                    <li class="py-3">
                        <div class="flex justify-between">
                            <div>
                                <p class="font-semibold text-gray-800"><?= esc($product['name']) ?></p>
                                <p class="text-sm text-gray-500">Stok Min: <?= $product['min_stock'] ?> | Saat ini:
                                    <?= $product['stock'] ?> pcs</p>
                            </div>
                            <span class="text-red-500 self-center">Perlu Restock</span>
                        </div>
                    </li>
                    <?php endforeach ?>
                </ul>
            </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Grafik Stok Masuk Bulanan</h3>
                    <input type="month" id="filterStockIn" class="border rounded px-2 py-1 text-sm"
                        value="<?= date('Y-m') ?>">
                </div>
                <canvas id="stockInChart"></canvas>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Grafik Stok Keluar Bulanan</h3>
                    <input type="month" id="filterStockOut" class="border rounded px-2 py-1 text-sm"
                        value="<?= date('Y-m') ?>">
                </div>
                <canvas id="stockOutChart"></canvas>
            </div>
        </section>

        <script>
        const ctxIn = document.getElementById('stockInChart').getContext('2d');
        const ctxOut = document.getElementById('stockOutChart').getContext('2d');
        let stockInChart = new Chart(ctxIn, {
            type: 'line',
            data: <?= json_encode($chartInData ?? []) ?>
        });
        let stockOutChart = new Chart(ctxOut, {
            type: 'line',
            data: <?= json_encode($chartOutData ?? []) ?>
        });

        document.getElementById('filterStockIn').addEventListener('change', function() {
            window.location.href = '?month_in=' + this.value;
        });
        document.getElementById('filterStockOut').addEventListener('change', function() {
            window.location.href = '?month_out=' + this.value;
        });
        </script>
    </main>

    <?= $this->include('layouts/footer') ?>
</div>