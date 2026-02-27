package com.service.admin.dto;

import com.service.admin.entity.CategoriesInAdmin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriesResponse {

    public CategoriesResponse(CategoriesInAdmin c) {
        this.id = c.getId();
        this.name = c.getName();
        this.parent_id = c.getParent_id();
    }

    private Integer id;
    private String name;
    private Integer parent_id;
}
