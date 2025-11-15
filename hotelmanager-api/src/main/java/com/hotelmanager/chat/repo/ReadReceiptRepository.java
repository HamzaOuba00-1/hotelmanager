package com.hotelmanager.chat.repo;

import com.hotelmanager.chat.entity.ReadReceipt;
import com.hotelmanager.chat.entity.ReadReceiptId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadReceiptRepository extends JpaRepository<ReadReceipt, ReadReceiptId> { }
