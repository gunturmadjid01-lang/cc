<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Administrator',
            'email' => 'admin@credit.test',
            'phone' => '081200000001',
            'role' => 'admin',
            'password' => 'password123',
        ]);

        $customer = User::factory()->create([
            'name' => 'Customer Demo',
            'email' => 'customer@credit.test',
            'phone' => '081200000002',
            'role' => 'customer',
            'password' => 'password123',
        ]);

        $customer->creditCardProfile()->create([
            'application_status' => 'draft',
        ]);
    }
}
